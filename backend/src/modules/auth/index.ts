import { Router } from 'express';
import { Request, Response } from 'express';
import { z } from 'zod';
import { isDbConnected } from '../../lib/db';
import { UserModel } from '../../models';
import { hashPassword, comparePassword } from '../../utils';
import { signToken } from '../../lib/auth';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth';
import { initialUsers } from '../../services/seedData';
import { verifyEmailSchema, resetPasswordSchema } from '../../validators';

// Validation Schemas (Single Responsibility)
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Domain Model & Storage
export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar: string;
  createdAt: string;
}

let usersStore = [...initialUsers];

export const authService = {
  async register(name: string, email: string, pass: string): Promise<UserDTO> {
    const existing = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email is already registered');
    }

    const newUser = {
      _id: `u-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(pass),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    };
    usersStore.push(newUser);

    if (isDbConnected()) {
      try {
        await UserModel.create({
          name: newUser.name,
          email: newUser.email,
          passwordHash: newUser.passwordHash,
          avatar: newUser.avatar,
          role: newUser.role,
        });
      } catch (err) {
        console.warn('[AuthService] DB sync fallback notice:', err);
      }
    }

    return {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
    };
  },

  async login(email: string, pass: string): Promise<UserDTO> {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if authenticating as admin using configured environment variable
    if (adminPassword && email.toLowerCase() === adminEmail && pass === adminPassword) {
      let admin = usersStore.find(u => u.email.toLowerCase() === adminEmail);
      if (!admin) {
        admin = {
          _id: 'u-admin',
          name: 'Admin Founder',
          email: adminEmail,
          passwordHash: hashPassword(adminPassword),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          role: 'admin' as const,
          createdAt: new Date().toISOString(),
        };
        usersStore.push(admin);
      }
      return {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
        createdAt: admin.createdAt,
      };
    }

    let user = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user && isDbConnected()) {
      try {
        const dbUser = await UserModel.findOne({ email: email.toLowerCase() });
        if (dbUser) {
          user = {
            _id: dbUser._id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            passwordHash: dbUser.passwordHash,
            avatar: dbUser.avatar,
            role: dbUser.role as any,
            createdAt: dbUser.createdAt?.toISOString() || new Date().toISOString(),
          };
          usersStore.push(user);
        }
      } catch (err) {
        console.warn('[AuthService] DB user lookup fallback notice:', err);
      }
    }

    if (!user || !comparePassword(pass, user.passwordHash)) {
      throw new Error('Invalid email or password');
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  },

  async getUserById(id: string): Promise<UserDTO | null> {
    let user = usersStore.find(u => u._id === id);
    if (!user && isDbConnected()) {
      try {
        const dbUser = await UserModel.findById(id);
        if (dbUser) {
          user = {
            _id: dbUser._id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            passwordHash: dbUser.passwordHash,
            avatar: dbUser.avatar,
            role: dbUser.role as any,
            createdAt: dbUser.createdAt?.toISOString() || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[AuthService] DB getUserById lookup notice:', err);
      }
    }
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  },

  getAllUsersCount(): number {
    return usersStore.length;
  },

  async verifyEmail(email: string): Promise<boolean> {
    const lowerEmail = email.toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();

    // Admin account always exists
    if (lowerEmail === adminEmail) return true;

    // Check in-memory store
    const inMemory = usersStore.find(u => u.email.toLowerCase() === lowerEmail);
    if (inMemory) return true;

    // Fall back to MongoDB
    if (isDbConnected()) {
      try {
        const dbUser = await UserModel.findOne({ email: lowerEmail }).lean();
        if (dbUser) return true;
      } catch (err) {
        console.warn('[AuthService] DB verifyEmail lookup notice:', err);
      }
    }

    return false;
  },

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const lowerEmail = email.toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();

    if (lowerEmail === adminEmail) {
      throw new Error('Admin password can only be changed via environment variables.');
    }

    const newHash = hashPassword(newPassword);

    // Update in-memory store — only change passwordHash
    const idx = usersStore.findIndex(u => u.email.toLowerCase() === lowerEmail);
    if (idx !== -1) {
      usersStore[idx] = { ...usersStore[idx], passwordHash: newHash };
    }

    // Update MongoDB — only the passwordHash field, nothing else
    if (isDbConnected()) {
      try {
        await UserModel.findOneAndUpdate(
          { email: lowerEmail },
          { $set: { passwordHash: newHash } },
          { new: true }
        );
      } catch (err) {
        console.warn('[AuthService] DB resetPassword update notice:', err);
      }
    }

    if (idx === -1) {
      // User wasn't in memory; check if they are in DB
      if (!isDbConnected()) {
        throw new Error('User not found. Please register first.');
      }
    }
  },
};

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      }

      const user = await authService.register(parsed.data.name, parsed.data.email, parsed.data.password);
      const token = signToken({
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({ token, user });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Registration failed' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      }

      const user = await authService.login(parsed.data.email, parsed.data.password);
      const token = signToken({
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ token, user });
    } catch (err: any) {
      return res.status(401).json({ error: err.message || 'Invalid credentials' });
    }
  },

  async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logged out successfully' });
  },

  async session(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Session not found' });
    }
    const user = await authService.getUserById(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'User does not exist' });
    }
    return res.json({ user });
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const parsed = verifyEmailSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid email' });
      }
      const exists = await authService.verifyEmail(parsed.data.email);
      if (!exists) {
        return res.status(404).json({ error: 'No account found with this email address.' });
      }
      return res.json({ valid: true, message: 'Email verified. You may set a new password.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Verification failed' });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      }
      await authService.resetPassword(parsed.data.email, parsed.data.newPassword);
      return res.json({ success: true, message: 'Password updated successfully. Please sign in with your new password.' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Password reset failed' });
    }
  },
};

export const authRouter = Router();
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/session', authMiddleware, authController.session);
authRouter.post('/forgot-password/verify', authController.verifyEmail);
authRouter.post('/forgot-password/reset', authController.resetPassword);
