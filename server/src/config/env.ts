import dotenv from 'dotenv';

dotenv.config();

export const env = {
	port: Number(process.env.PORT || 4000),
	databasePath: process.env.DATABASE_PATH || 'data/smartshop.db',
	jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
};


