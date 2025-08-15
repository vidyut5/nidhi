import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const nameRaw = typeof (body as any)?.name === 'string' ? (body as any).name : '';
    const emailRaw = typeof (body as any)?.email === 'string' ? (body as any).email : '';
    const phoneRaw = typeof (body as any)?.phone === 'string' ? (body as any).phone : '';
    const passwordRaw = typeof (body as any)?.password === 'string' ? (body as any).password : '';

    const name = nameRaw.trim();
    const email = emailRaw.trim().toLowerCase();
    const phone = phoneRaw.trim();
    const password = passwordRaw.trim();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const exist = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (exist) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    const isProd = process.env.NODE_ENV === 'production';
    const message = error?.message ?? 'Unknown error';
    if (!isProd) {
      console.error('signup route error:', message, error?.stack);
    } else {
      console.error('signup route error:', message);
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
