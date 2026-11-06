import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Carrega as variáveis do .env e disponibiliza
    // ConfigService globalmente na aplicação.
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configuração da conexão com PostgreSQL.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),

        // Carrega automaticamente as entidades registradas
        // nos módulos da aplicação.
        autoLoadEntities: true,

        // O esquema será gerenciado por migrations.
        synchronize: false,
      }),
    }),
  ],
})
export class AppModule {}