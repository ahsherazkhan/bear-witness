'use client';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/app/login/actions';
import Image from 'next/image';

interface Props {
  label: string;
  fromExtension?: boolean;
}

export function GoogleLoginButton({ label, fromExtension = false }: Props) {
  return (
    <div
      className={
        'mx-auto w-[343px] md:w-[488px] px-6 md:px-16 pt-0 gap-4 flex flex-col items-center justify-center rounded-b-lg'
      }
    >
      <div className={'flex w-full items-center justify-center'}>
        <Separator className={'w-5/12 bg-border'} />
        <div className={'text-black text-xs font-medium px-4'}>or</div>
        <Separator className={'w-5/12 bg-border'} />
      </div>
      <Button
        onClick={() => signInWithGoogle(fromExtension)}
        variant={'secondary'}
        className={'w-full text-black bg-gray-300'}
      >
        <Image
          height="24"
          width="24"
          className={'mr-3'}
          src="https://cdn.simpleicons.org/google/878989"
          unoptimized={true}
          alt="Google logo"
        />
        {label}
      </Button>
    </div>
  );
}
