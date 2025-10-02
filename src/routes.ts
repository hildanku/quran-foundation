import { Hono } from 'hono'
import { userController } from '@/modules/user/user.controller.js'
import { authController } from '@/modules/authentication/authentication.controller.js'
import { recordingsController } from '@/modules/recordings/recordings.controller.js'
import { streaksController } from '@/modules/streaks/streaks.controller.js'
import { surahsController } from '@/modules/surahs/surahs.controller.js'

export const v1Routes = new Hono()
    .route('/users', userController)
    .route('/auth', authController)
    .route('/recordings', recordingsController)
    .route('/streaks', streaksController)
    .route('/surahs', surahsController)
