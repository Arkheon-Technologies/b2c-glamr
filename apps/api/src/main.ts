import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS — FRONTEND_URL can be a comma-separated list of allowed origins
  // e.g. "https://glamr-web.vercel.app,https://glamr-jn21n071d-davidles-projects.vercel.app"
  // In development, localhost:3000 is always allowed.
  const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigins = rawOrigins
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any *.vercel.app preview URL for the same project slug
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      // Allow localhost on any port for local dev
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 GLAMR API running on http://localhost:${port}/api/v1`);
}
bootstrap();
