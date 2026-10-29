import { motion, useReducedMotion } from 'framer-motion'

export function FadeUp({
  children,
  className = '',
  delay = 0,
  distance = 20,
  duration = 0.45,
  once = true,
  ...props
}) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduce ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={{
        duration: shouldReduce ? 0 : duration,
        delay: shouldReduce ? 0 : delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.07,
  delayChildren = 0.05,
  once = true,
  ...props
}) {
  const shouldReduce = useReducedMotion()

  const variants = {
    hidden: { opacity: shouldReduce ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduce ? 0 : stagger,
        delayChildren: shouldReduce ? 0 : delayChildren,
      },
    },
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = '',
  distance = 18,
  duration = 0.4,
  as = 'div',
  ...props
}) {
  const shouldReduce = useReducedMotion()
  const Component = motion[as] || motion.div

  const itemVariants = {
    hidden: { opacity: shouldReduce ? 1 : 0, y: shouldReduce ? 0 : distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? 0 : duration,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  }

  return (
    <Component variants={itemVariants} className={className} {...props}>
      {children}
    </Component>
  )
}
