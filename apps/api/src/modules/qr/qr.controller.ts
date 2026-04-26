import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import QRCode from 'qrcode';

/**
 * QR Code generator endpoint.
 *
 * GET /api/v1/qr?url=https://glamr.ro/business/sala-studio&format=svg
 * GET /api/v1/qr?url=...&format=png&size=300
 *
 * Returns an inline SVG or PNG image — suitable for embedding in receipts,
 * confirmation emails, or the studio "share my booking link" feature.
 */
@Controller('qr')
export class QrController {
  @Get()
  async generateQr(
    @Query('url') url: string,
    @Query('format') format: 'svg' | 'png' = 'svg',
    @Query('size') size = '300',
    @Query('margin') margin = '2',
    @Res() res: Response,
  ) {
    if (!url) {
      throw new BadRequestException({ ok: false, error: { code: 'URL_REQUIRED', message: 'url query parameter is required' } });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new BadRequestException({ ok: false, error: { code: 'INVALID_URL', message: 'url must be a valid URL' } });
    }

    const sizeNum = Math.min(Math.max(parseInt(size) || 300, 64), 1024);
    const marginNum = Math.min(Math.max(parseInt(margin) || 2, 0), 8);

    if (format === 'png') {
      const buffer = await QRCode.toBuffer(url, {
        type: 'png',
        width: sizeNum,
        margin: marginNum,
        color: {
          dark: '#2A1F1A',   // --ink
          light: '#F7F4EE',  // --paper
        },
        errorCorrectionLevel: 'M',
      });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } else {
      const svg = await QRCode.toString(url, {
        type: 'svg',
        margin: marginNum,
        color: {
          dark: '#2A1F1A',
          light: '#F7F4EE',
        },
        errorCorrectionLevel: 'M',
        width: sizeNum,
      });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(svg);
    }
  }
}
