import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight } from 'lucide-react';

export function PoweredByPaddle() {
  return (
    <>
      <Separator className={'footer-border'} />
      <div
        className={
          'flex flex-col justify-center items-center gap-2 text-muted-foreground text-sm leading-[14px] py-[24px]'
        }
      >
        <div className={'flex justify-center items-center gap-2 flex-wrap md:flex-nowrap'}>
          <Link className={'text-sm leading-[14px]'} href={'/terms'}>
            <span className={'flex items-center gap-1'}>Terms of Service</span>
          </Link>
          <Link className={'text-sm leading-[14px]'} href={'/privacy'}>
            <span className={'flex items-center gap-1'}>Privacy Policy</span>
          </Link>
          <Link className={'text-sm leading-[14px]'} href={'/refund'}>
            <span className={'flex items-center gap-1'}>Refund Policy</span>
          </Link>
        </div>
      </div>
    </>
  );
}
