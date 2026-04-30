import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import * as categoryInterface from '../interface/category.interface.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService){}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post('create-category')
    async createCategory(@Body() categoryData: categoryInterface.categoryProps){
        const result = await this.categoryService.createCategory(categoryData);
        return {
            statusCode: 201,
            message: "Berhasil membuat category!",
            data: result,
        };
    }

    @Get()
    async findAll() {
        const result = await this.categoryService.findAllCategory();
        return {
            statusCode: 200,
            message: "Berhasil mengambil semua category!",
            data: result,
        };
    }
    
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch('/:id') 
    async editCategory(
        @Param('id') id: string, 
        @Body('name') name: string 
    ) {
        const result = await this.categoryService.editCategory(Number(id), name);
        return {
            statusCode: 200,
            message: "Berhasil mengubah category!",
            data: result
        };
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete('/:id')
    async deleteCategory(@Param('id') id: string) {
        const result = await this.categoryService.deleteCategory(Number(id));
        return {
            statusCode: 200,
            message: "Berhasil menghapus category!",
            data: result
        };
    }
}
