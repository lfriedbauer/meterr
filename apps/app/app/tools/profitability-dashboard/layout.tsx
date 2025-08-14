import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Profitability Dashboard - Meterr',
  description: 'Your AI CFO - Maximize returns on AI investments with real-time profitability tracking',
};

export default function ProfitabilityDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      <style>{`
        :root {
          --meterr-forest: #1B4332;
          --meterr-sage: #52796F;
          --meterr-lime: #95D5B2;
          --meterr-charcoal: #2D3748;
          --meterr-soft-gray: #F7FAFC;
        }
        
        .meterr-gradient {
          background: linear-gradient(135deg, var(--meterr-forest) 0%, var(--meterr-sage) 100%);
        }
        
        .meterr-accent {
          color: var(--meterr-lime);
        }
        
        /* Custom meter-inspired animation */
        @keyframes meter-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .meter-pulse {
          animation: meter-pulse 2s ease-in-out infinite;
        }
      `}</style>
      {children}
    </div>
  );
}