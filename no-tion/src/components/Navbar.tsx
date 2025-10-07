import { UserIcon } from 'lucide-react'
import React from 'react'
import { useStore } from '@/store'
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from './ui/dropdown-menu'
import { userStore } from '@/store/userStore'
import { useLogout } from '@/hooks/useAuth'
import { Spinner } from './ui/spinner'
import { useRouter } from 'next/navigation'


const Navbar = () => {
  const { user } = userStore()
  const { mutate, isPending } = useLogout()

  const router = useRouter()
  const logout = () => {
    mutate()
    router.push('/auth')
  }

  return (
    <div className='py-2 bg-primary flex items-center px-10'>
      <h1>Navbar</h1>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <UserIcon className='text-white' />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => logout()}>{isPending ? <Spinner /> : 'Cerrar sesión'}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className='text-white'>{user?.email}</p>
    </div>
  )
}

export default Navbar
