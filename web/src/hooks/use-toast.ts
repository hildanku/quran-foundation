
"use client"

import * as React from 'react'
import { toast as sonnerToast } from 'sonner'

type ToastVariant = "default" | "destructive"

type Toast = {
    title?: React.ReactNode
    description?: React.ReactNode
    variant?: ToastVariant
}

function toast({ title, description, variant = "default" }: Toast) {
    if (variant === "destructive") {
        return sonnerToast.error(title, {
            description: description?.toString(),
        })
    }
    
    return sonnerToast.success(title, {
        description: description?.toString(),
    })
}

function useToast() {
    return {
        toast,
        dismiss: sonnerToast.dismiss,
    }
}

export { useToast, toast }
