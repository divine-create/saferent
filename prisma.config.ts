import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'

dotenv.config({ override: true })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL!,
  },
})
