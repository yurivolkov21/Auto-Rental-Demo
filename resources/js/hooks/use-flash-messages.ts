import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { SharedData } from '@/types';
import { toast } from './use-toast';

export function useFlashMessages() {
    const { flash } = usePage<{ flash?: SharedData['flash'] }>().props;

    useEffect(() => {
        if (flash?.success) {
            toast({
                variant: 'success',
                title: 'Success',
                description: flash.success,
            });
        }

        if (flash?.error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: flash.error,
            });
        }

        if (flash?.warning) {
            toast({
                variant: 'default',
                title: 'Warning',
                description: flash.warning,
            });
        }

        if (flash?.info) {
            toast({
                variant: 'default',
                title: 'Info',
                description: flash.info,
            });
        }
    }, [flash]);
}
