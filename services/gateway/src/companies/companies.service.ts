import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CredentialResponseDto } from './dto/credential-response.dto';

const COMPANIES_BASE_URL = 'http://company_service:8000/companies';
@Injectable()
export class CompanyManagementService {
  private readonly baseUrl = `${COMPANIES_BASE_URL}`;

  constructor(private readonly httpService: HttpService) {}

  async createCompany(createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/register`, createCompanyDto)
      );
      return response.data;
    } catch (error: any) {
      console.log('Error creating company:', error);
      throw new HttpException(
        error.response?.data || 'Error creating company',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCompany(id: number): Promise<CompanyResponseDto> {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/${id}`));
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Company not found',
        error.response?.status || HttpStatus.NOT_FOUND
      );
    }
  }

  async getCompanies(skip: number, limit: number): Promise<CompanyResponseDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}?skip=${skip}&limit=${limit}`)
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error fetching companies',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async approveCompany(id: number): Promise<CompanyResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/${id}/approve`)
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error approving company',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async generateCredentials(id: number, role: string): Promise<CredentialResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/${id}/credentials?role=${role}`)
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error generating credentials',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
