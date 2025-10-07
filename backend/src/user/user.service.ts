/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from './schemas/user.schema'
import { Model, StringSchemaDefinition } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class UserService {
  constructor (
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async create (createUserDto: CreateUserDto) {
    const { email, password } = createUserDto
    const hashPassword = await bcrypt.hash(password, 10)
    const user = new this.userModel({ email, password: hashPassword })
    return user.save()
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  findOne (id: string): Promise<User | null> {
    return this.userModel.findOne({ _id: id }).exec()
  }

  async validatePassword (password: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(password, hashed)
  }

  async validateUser (email: string, pass: string): Promise<any> {
    const user = await this.findByEmail(email)
    if (user && (await this.validatePassword(pass, user.password))) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
  
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Credenciales inválidas');
  
    // payload correcto con email y sub (id)
    const payload = { email: user.email, sub: user._id };
  
    const token = this.jwtService.sign(payload);
  
    return {
      access_token: token,
      user: {
        _id: user._id,
        email: user.email,
      },
    };
  }

  remove (id: number) {
    return `This action removes a #${id} user`
  }
}
