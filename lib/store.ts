'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ReportStatus = 'pending' | 'in-progress' | 'done'

export interface Report {
  id: string
  category: string
  description: string
  location: string
  imageUrl?: string
  status: ReportStatus
  createdAt: string
  updatedAt: string
  editToken: string // Token for anonymous editing/deleting
}

export interface Category {
  id: string
  name: string
  icon: string
}

export interface Admin {
  username: string
  password: string
}

export interface LineNotifySettings {
  token: string
  enabled: boolean
}

interface ReportStore {
  reports: Report[]
  categories: Category[]
  admin: Admin
  isAdminLoggedIn: boolean
  lineNotify: LineNotifySettings
  
  // Report actions
  addReport: (report: Omit<Report, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'editToken'>) => string
  updateReport: (id: string, updates: Partial<Report>) => void
  deleteReport: (id: string) => void
  getReportById: (id: string) => Report | undefined
  getReportByEditToken: (editToken: string) => Report | undefined
  updateReportStatus: (id: string, status: ReportStatus) => void
  
  // Admin actions
  loginAdmin: (username: string, password: string) => boolean
  logoutAdmin: () => void
  
  // LINE Notify actions
  updateLineNotifySettings: (settings: Partial<LineNotifySettings>) => void
  sendLineNotify: (message: string) => Promise<boolean>
}

const defaultCategories: Category[] = [
  { id: '1', name: 'ไฟฟ้า', icon: 'Lightbulb' },
  { id: '2', name: 'แอร์/เครื่องปรับอากาศ', icon: 'Wind' },
  { id: '3', name: 'ประปา/ห้องน้ำ', icon: 'Droplets' },
  { id: '4', name: 'อุปกรณ์ชำรุด', icon: 'Wrench' },
  { id: '5', name: 'ความสะอาด', icon: 'Sparkles' },
  { id: '6', name: 'อินเทอร์เน็ต/คอมพิวเตอร์', icon: 'Wifi' },
  { id: '7', name: 'อื่นๆ', icon: 'MoreHorizontal' },
]

const generateId = () => Math.random().toString(36).substring(2, 15)
const generateEditToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: [],
      categories: defaultCategories,
      admin: { username: 'admin', password: 'admin123' },
      isAdminLoggedIn: false,
      lineNotify: { token: '', enabled: false },

      addReport: (reportData) => {
        const editToken = generateEditToken()
        const newReport: Report = {
          ...reportData,
          id: generateId(),
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          editToken,
        }
        set((state) => ({
          reports: [newReport, ...state.reports],
        }))
        return editToken
      },

      updateReport: (id, updates) => {
        set((state) => ({
          reports: state.reports.map((report) =>
            report.id === id
              ? { ...report, ...updates, updatedAt: new Date().toISOString() }
              : report
          ),
        }))
      },

      deleteReport: (id) => {
        set((state) => ({
          reports: state.reports.filter((report) => report.id !== id),
        }))
      },

      getReportById: (id) => {
        return get().reports.find((report) => report.id === id)
      },

      getReportByEditToken: (editToken) => {
        return get().reports.find((report) => report.editToken === editToken)
      },

      updateReportStatus: (id, status) => {
        set((state) => ({
          reports: state.reports.map((report) =>
            report.id === id
              ? { ...report, status, updatedAt: new Date().toISOString() }
              : report
          ),
        }))
      },

      loginAdmin: (username, password) => {
        const { admin } = get()
        if (username === admin.username && password === admin.password) {
          set({ isAdminLoggedIn: true })
          return true
        }
        return false
      },

      logoutAdmin: () => {
        set({ isAdminLoggedIn: false })
      },

      updateLineNotifySettings: (settings) => {
        set((state) => ({
          lineNotify: { ...state.lineNotify, ...settings },
        }))
      },

      sendLineNotify: async (message) => {
        const { lineNotify } = get()
        if (!lineNotify.enabled || !lineNotify.token) {
          return false
        }

        try {
          const response = await fetch('/api/line-notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, token: lineNotify.token }),
          })
          const data = await response.json()
          return data.success
        } catch (error) {
          console.error('Failed to send LINE notification:', error)
          return false
        }
      },
    }),
    {
      name: 'smart-report-storage',
    }
  )
)
