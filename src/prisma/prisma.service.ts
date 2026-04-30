import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import "dotenv/config";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy{
    constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
