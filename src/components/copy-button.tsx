
"use client";

import { useState, type ComponentPropsWithoutRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy as CopyIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CopyButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  textToCopy: string;
}

export function CopyButton({ textToCopy, children, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const copyToClipboard = async () => {
    if (!isClient || !navigator.clipboard) {
      toast({ variant: "destructive", title: "Error", description: "Clipboard API not available." });
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      setHasCopied(true);
      toast({ title: "Copied!", description: "Schema copied to clipboard." });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to copy." });
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button onClick={copyToClipboard} {...props} disabled={props.disabled || !isClient}>
      {hasCopied ? <Check className="mr-2 h-4 w-4" /> : <CopyIcon className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );
}
