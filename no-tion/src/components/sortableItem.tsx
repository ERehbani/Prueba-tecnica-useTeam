'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '../lib/task'
import { X } from 'lucide-react'
import { Button } from './ui/button'
import { useDeleteTask } from '@/hooks/useTasks'
import { Spinner } from './ui/spinner'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Field, FieldLabel } from './ui/field'
import { Input } from './ui/input'
import { useRef } from 'react'

function SortableItem({
  task,
  id
}: {
  task?: Task | undefined
  id: string | undefined
  handle?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task?._id || id || '' })

  const emailRef = useRef<HTMLInputElement>(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const { mutate, isPending } = useDeleteTask()

  console.log(task)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={
        isDragging
          ? 'bg-gray-200 p-2 mb-2 rounded shadow cursor-grab text-white-600 flex'
          : 'bg-primary p-2 mb-2 rounded shadow cursor-grab flex flex-col gap-3 text-gray-200'
      }
    >
      <Dialog>
        <DialogTrigger className='self-start w-full flex flex-col gap-3 p-2'>
          <div>
            <div className="flex justify-between">
              <h3 className='font-bold text-xl text-start'>{task?.title}</h3>
              <Button variant="ghost" className='size-6 p-0' onClick={() => mutate(task?._id)}>{isPending ? <Spinner /> : <X className='w-2' />}</Button>
            </div>

            <div>
              <p className='text-sm text-start'>{task?.description}</p>
              {task?.responsability &&
                task?.responsability.map(responsability => (
                  <div
                    className='block bg-accent px-3 rounded text-black w-fit text-xs font-semibold'
                    key={responsability}
                  >
                    <span>{responsability}</span>
                  </div>
                ))}
              {task?.tags &&
                task?.tags.map(tag => (
                  <div
                    className='block bg-accent px-3 rounded text-black w-fit text-xs font-semibold'
                    key={tag}
                  >
                    <span>{tag}</span>
                  </div>
                ))}
            </div>

          </div>
        </DialogTrigger>
        <DialogContent className='bg-[#2a2a2a] border-none text-white'>

          <section className='flex flex-col gap-2'>
            <h2 className='text-md font-semibold'>Título:</h2>
            <p>{task?.title}</p>
          </section>
          <section className='flex flex-col gap-2'>
            <h2 className='text-md font-semibold'>Descripción:</h2>
            <p>{task?.description}</p>
          </section>
          {task?.responsability &&
            task?.responsability.map(responsability => (
              <section className='flex flex-col gap-2'>
                <h2 className='text-md font-semibold'>Responsabilidad:</h2>
                <div
                  className='block bg-accent px-3 rounded text-black w-fit text-xs font-semibold'
                  key={responsability}
                >
                  <span>{responsability}</span>
                </div>
              </section>
            ))}
          {task?.tags &&
            task?.tags.map(tag => (
              <section className='flex flex-col gap-2'>
                <h2 className='text-md font-semibold'>Tags:</h2>
                <div
                  className='block bg-accent px-3 rounded text-black w-fit text-xs font-semibold'
                  key={tag}
                >
                  <span>{tag}</span>
                </div>
              </section>
            ))}
          <div>


          </div>
          <Field>
            <FieldLabel>Invitar a una persona</FieldLabel>
            <div className="flex flex-wrap justify-between items-center gap-5">
              <Input type='email' placeholder='correo@email.com' value={emailRef.current?.value} ref={emailRef} onChange={(e) => emailRef.current && (emailRef.current.value = e.target.value)} />
              <Button className='w-fit' onClick={() => console.log(emailRef.current?.value)}>Enviar invitación</Button>
            </div>
          </Field>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SortableItem
