'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProfileData {
  username: string
  email: string
  createdAt: string
  conversationCount: number
  messageCount: number
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6">
      <p className="text-2xl font-bold text-stone-900 tabular-nums">{value}</p>
      <p className="text-sm text-stone-400 mt-1">{label}</p>
    </div>
  )
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Password change
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  // Delete account
  const [deletePw, setDeletePw] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/profile')
      .then((r) => r.json())
      .then(setProfile)
      .finally(() => setLoadingProfile(false))
  }, [status])

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)
    setPwLoading(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    setPwLoading(false)
    if (res.ok) {
      setPwSuccess(true)
      setCurrentPw('')
      setNewPw('')
    } else {
      const data = await res.json()
      setPwError(data.error || 'Failed to update password')
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('')
    setDeleteLoading(true)
    const res = await fetch('/api/profile', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: deletePw }),
    })
    setDeleteLoading(false)
    if (res.ok) {
      await signOut({ callbackUrl: '/' })
    } else {
      const data = await res.json()
      setDeleteError(data.error || 'Failed to delete account')
    }
  }

  if (status === 'loading' || loadingProfile) {
    return (
      <div className="min-h-[100dvh] bg-stone-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-[100dvh] bg-stone-50">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <Link href="/chat" className="text-sm text-stone-400 hover:text-stone-600 transition-colors mb-6 inline-block">
            &larr; Back to chat
          </Link>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Profile</h1>
          <p className="text-stone-400 text-sm mt-1">Manage your account</p>
        </div>

        {/* Account info */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-sm text-stone-500">Username</span>
              <span className="text-sm font-medium text-stone-800 font-mono">{profile.username}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-sm text-stone-500">Email</span>
              <span className="text-sm font-medium text-stone-800">{profile.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-stone-500">Member since</span>
              <span className="text-sm font-medium text-stone-800">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard label="Conversations" value={profile.conversationCount} />
          <StatCard label="Messages sent" value={profile.messageCount} />
        </div>

        {/* Change password */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {pwError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
                Password updated successfully
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-sm text-stone-700 font-medium">Current password</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                placeholder="Your current password"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-stone-700 font-medium">New password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
                minLength={8}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                placeholder="Min. 8 characters"
              />
            </div>
            <button
              type="submit"
              disabled={pwLoading}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              {pwLoading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white border border-red-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-1">Danger Zone</h2>
          <p className="text-xs text-stone-400 mb-4">Deleting your account is permanent. All conversations are removed.</p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-50 hover:bg-red-100 active:scale-[0.98] text-red-600 border border-red-200 font-medium px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              Delete account
            </button>
          ) : (
            <div className="space-y-3">
              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {deleteError}
                </div>
              )}
              <div className="space-y-2">
                <label className="block text-sm text-stone-700 font-medium">Confirm your password</label>
                <input
                  type="password"
                  value={deletePw}
                  onChange={(e) => setDeletePw(e.target.value)}
                  className="w-full bg-stone-50 border border-red-200 rounded-xl px-4 py-3 text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
                  placeholder="Enter password to confirm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || !deletePw}
                  className="bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
                >
                  {deleteLoading ? 'Deleting...' : 'Permanently delete'}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeletePw(''); setDeleteError('') }}
                  className="bg-stone-100 hover:bg-stone-200 active:scale-[0.98] text-stone-700 font-medium px-5 py-2.5 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
