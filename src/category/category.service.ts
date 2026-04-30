import { categoryProps } from '../interface/category.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

@Injectable()
export class CategoryService {
    constructor(private prisma:PrismaService){}

    async createCategory(categoryData:categoryProps){
        const categoryExists = await this.prisma.category.findFirst({
            where: {id: categoryData.id}
        });
        if(categoryExists){
            throw new BadRequestException('Category ini sudah ada.');
        }
        return await this.prisma.category.create({
            data: {
                name: categoryData.name,
            }
        });
    }

    async findAllCategory(){
        try {
            return await this.prisma.category.findMany();
        } catch (error) {
            console.error(error); 
            throw error;
        }
    }

    async editCategory(categoryId: number, categoryName){
        try {
            return await this.prisma.category.update({
                where: {id:categoryId},
                data:{
                    name: categoryName
                }
            })
        } catch (error:any) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Category Id ${categoryId} tidak ditemukan`);
            }
            console.error(error);
            throw new InternalServerErrorException('Gagal mengubah category');
        }
    }

    async deleteCategory(categoryId:number){
        try {
            return await this.prisma.category.delete({where:{id:categoryId}})
        } catch (error:any) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Category Id ${categoryId} tidak ditemukan`);
            }
            console.error(error);
            throw new InternalServerErrorException('Gagal menghapus category');
        }
    }
}
