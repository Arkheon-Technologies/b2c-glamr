import { Controller } from '@nestjs/common';
import { UportfolioService } from './portfolio.service';

@Controller('portfolio')
export class UportfolioController {
  constructor(private readonly portfolioService: UportfolioService) {}
}
