import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GrpcMethod } from '@nestjs/microservices';
import { EncryptUtil } from '@app/util';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly encryptUtil: EncryptUtil,
  ) {}

  /**
   * 유저 생성
   * @param userData
   * @return Promise<UserEntity>
   */
  async createUser(userData: {
    email: string;
    password: string;
  }): Promise<UserEntity> {
    return this.userRepository.save({
      email: userData.email,
      password: this.encryptUtil.encryptForPassword(userData.password),
      status: 'ACTIVE',
    });
  }

  /**
   * 유저 아이디 조회
   * @param id
   * @return Promise<UserEntity>
   */
  async getUserById(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  /**
   * 유저 이메일 조회
   * @param email
   * @return Promise<UserEntity>
   */
  @GrpcMethod('UserService', 'GetUserByEmail')
  async getUserByEmail({ email: email }): Promise<UserEntity> {
    return await this.userRepository.findOne({
      email: email,
    });
  }

  /**
   * 유저 이메일&비밀번호 조회
   * @param email
   * @param password
   */
  @GrpcMethod('UserService', 'GetUserByEmailPassword')
  async getUserByEmailPassword({
    email: email,
    password: password,
  }): Promise<UserEntity> {
    return await this.userRepository.findOne({
      email: email,
      password: this.encryptUtil.encryptForPassword(password),
    });
  }

  /**
   * 활성 유저 이메일 조회
   * @param email
   */
  @GrpcMethod('UserService', 'GetActiveUserByEmail')
  async getActiveUserByEmail({ email: email }): Promise<UserEntity> {
    return await this.userRepository.findOne({
      email: email,
      status: 'ACTIVE',
    });
  }

  /**
   * 유저 삭제
   * @param id
   * @return Promise<UserEntity>
   */
  async deleteUserById(id: number): Promise<UserEntity> {
    const user = await this.getUserById(id);

    /** 유저 삭제 */
    await this.userRepository.delete(id);

    return user;
  }
}