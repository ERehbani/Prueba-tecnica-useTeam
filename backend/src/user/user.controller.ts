/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UserService } from './user.service'

type loginType = {
  _id: string
  email: string
}

@Controller('user')
export class UserController {
  constructor (private readonly userService: UserService) {}

  @Post('register')
  async register (@Body() createUserDto: CreateUserDto) {
    const { email, password } = createUserDto
    const existingUser = await this.userService.findByEmail(email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    const user = await this.userService.create({ email, password })
    const { password: pass, ...result } = user.toObject()
    return {
      message: 'Usuario creado satisfactoriamente',
      user: result,
    }
  }

  @Post('login')
  async login (@Body() body: { email: string; password: string }) {
    console.log(body)
    const result = await this.userService.login(body.email, body.password)
    console.log(result)
    return result
  }
  @Delete(':id')
  remove (@Param('id') id: string) {
    return this.userService.remove(+id)
  }
}
