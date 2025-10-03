import {type ComponentPropsWithRef} from 'react'
import {ScrollView} from 'react-native'

import { useDraggableScroll } from '@/hooks/useDraggableScrollView'
import { isWeb } from '@/platform/detection'

export function DraggableScrollView({
  ref,
  style,
  ...props
}: ComponentPropsWithRef<typeof ScrollView>) {
  const {refs} = useDraggableScroll<ScrollView>({
    outerRef: ref,
    cursor: 'grab', // optional, default
  })

  return (
    <ScrollView
      ref={refs}
      style={[style, isWeb ? { userSelect: 'none' } : {}]}
      horizontal
      {...props}
    />
  )
}
