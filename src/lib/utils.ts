import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/* tailwind-merge can't infer which custom `text-*` theme keys are font
   sizes vs colours — without this it treats them as one group and drops
   whichever comes first (e.g. `text-on-primary` lost to `text-body-sm`). */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'hero',
            'section',
            'display-lg',
            'display',
            'h2',
            'h3',
            'body-lg',
            'body',
            'body-sm',
            'caption',
            'micro',
          ],
        },
      ],
      'font-weight': [{ font: ['regular'] }],
    },
  },
})

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
