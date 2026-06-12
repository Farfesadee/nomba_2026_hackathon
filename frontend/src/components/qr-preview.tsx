'use client';

import { useEffect, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { FastAverageColor } from 'fast-average-color';

interface QRPreviewProps {
  qrValue: string;
  imageUrl: string;
  title?: string;
  size?: number;
}

export function QRPreview({ qrValue, imageUrl, title, size = 160 }: QRPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!qrValue || !imageUrl) {
      setLoading(false);
      return;
    }

    const generateQR = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get dominant color from image
        const fac = new FastAverageColor();
        const color = await fac.getColorAsync(imageUrl);
        const dominantColor = color.hex;

        // Create QR code
        const qrCode = new QRCodeStyling({
          width: size,
          height: size,
          data: qrValue,
          image: imageUrl,
          dotsOptions: {
            color: dominantColor,
            type: 'rounded',
          },
          cornersSquareOptions: {
            color: dominantColor,
            type: 'extra-rounded',
          },
          cornersDotOptions: {
            color: dominantColor,
            type: 'square',
          },
          backgroundOptions: {
            color: '#ffffff',
          },
          imageOptions: {
            crossOrigin: 'anonymous',
            margin: 8,
            imageSize: Math.max(60, Math.floor(size * 0.35)),
            hideBackgroundDots: true,
          },
        });

        // Get QR code as image URL
        const url = await qrCode.getRawData('png');
        if (url) {
          const objectUrl = URL.createObjectURL(url as Blob);
          setQrImageUrl(objectUrl);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
        setLoading(false);
      }
    };

    generateQR();
  }, [qrValue, imageUrl, size]);

  return (
    <div className="flex flex-col items-center gap-4">
      {title && <p className="text-sm font-semibold text-[#0D1B2A]">{title}</p>}

      <div className="flex items-center justify-center p-2 bg-white border border-[#e8edf2]" style={{ borderRadius: '20px' }}>
        {loading && (
          <div style={{ width: `${size}px`, height: `${size}px` }} className="flex items-center justify-center text-[#94a3b8]">
            Generating QR...
          </div>
        )}

        {error && (
          <div style={{ width: `${size}px`, height: `${size}px` }} className="flex items-center justify-center text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {!loading && !error && qrImageUrl && (
          <img
            src={qrImageUrl}
            alt="QR Code"
            onError={() => setError('Failed to load QR image')}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '16px',
              display: 'block',
            }}
          />
        )}
      </div>
    </div>
  );
}
