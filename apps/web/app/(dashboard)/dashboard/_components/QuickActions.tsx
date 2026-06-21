'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui'
import { staggerContainer, fadeInUp } from '@/lib/animations'

const actions = [
  { label: 'Add Expense', icon: '💸', href: '/budget?addExpense=true', color: '#ef4444' },
  { label: 'Add Income', icon: '💰', href: '/budget?addIncome=true', color: '#10b981' },
  { label: 'View Debts', icon: '🏦', href: '/debts', color: '#6366f1' },
  { label: 'View Goals', icon: '🎯', href: '/goals', color: '#f59e0b' },
]

export function QuickActions() {
  return (
    <Card>
      <h2 className="font-semibold text-text-primary mb-4">Quick Actions</h2>
      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {actions.map((action) => (
          <motion.div key={action.href} variants={fadeInUp}>
            <Link href={action.href}>
              <motion.div
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-elevated border border-surface-border cursor-pointer text-center"
                whileHover={{ y: -2, boxShadow: `0 4px 16px ${action.color}20` }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs font-semibold text-text-secondary">{action.label}</span>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </Card>
  )
}
