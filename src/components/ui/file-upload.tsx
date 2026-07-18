import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/src/lib/utils'

const fileUploadVariants = cva(
  'flex w-full cursor-pointer items-center gap-3.5 rounded-md border-[1.5px] border-dashed px-5 py-4.5 text-left transition-[border-color,background-color] duration-150 outline-none focus-visible:border-border-focus focus-visible:ring-3 focus-visible:ring-primary-50',
  {
    variants: {
      variant: {
        default: 'border-border-strong bg-raised hover:border-primary-400 hover:bg-primary-50',
        filled:
          'cursor-default border-solid border-border bg-card [&_[data-slot=file-upload-icon]]:bg-success-bg [&_[data-slot=file-upload-icon]]:text-success',
        error:
          'cursor-default border-destructive bg-destructive-bg [&_[data-slot=file-upload-description]]:font-semibold [&_[data-slot=file-upload-description]]:text-destructive [&_[data-slot=file-upload-icon]]:bg-destructive-soft [&_[data-slot=file-upload-icon]]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type FileUploadProps = React.ComponentProps<'button'> &
  VariantProps<typeof fileUploadVariants>

const FileUpload = ({ className, variant, ...props }: FileUploadProps) => {
  return (
    <button
      type="button"
      data-slot="file-upload"
      className={cn(fileUploadVariants({ variant, className }))}
      {...props}
    />
  )
}

type FileUploadIconProps = React.ComponentProps<'span'>

const FileUploadIcon = ({ className, ...props }: FileUploadIconProps) => {
  return (
    <span
      data-slot="file-upload-icon"
      className={cn(
        'grid size-10.5 flex-none place-items-center rounded-sm bg-primary-100 text-primary-700 [&_svg]:size-5.25',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

type FileUploadBodyProps = React.ComponentProps<'span'>

const FileUploadBody = ({ className, ...props }: FileUploadBodyProps) => {
  return (
    <span
      data-slot="file-upload-body"
      className={cn('min-w-0', className)}
      {...props}
    />
  )
}

type FileUploadTitleProps = React.ComponentProps<'span'>

const FileUploadTitle = ({ className, ...props }: FileUploadTitleProps) => {
  return (
    <span
      data-slot="file-upload-title"
      className={cn('block text-body-sm font-bold text-heading', className)}
      {...props}
    />
  )
}

type FileUploadDescriptionProps = React.ComponentProps<'span'>

const FileUploadDescription = ({
  className,
  ...props
}: FileUploadDescriptionProps) => {
  return (
    <span
      data-slot="file-upload-description"
      className={cn('mt-0.5 block text-caption text-muted', className)}
      {...props}
    />
  )
}

export {
  FileUpload,
  FileUploadIcon,
  FileUploadBody,
  FileUploadTitle,
  FileUploadDescription,
  fileUploadVariants,
}
