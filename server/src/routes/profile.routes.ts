import { Router, Request, Response } from 'express';

const router = Router();

router.patch('/profile', async (req: Request, res: Response) => {
    try {
        const { name, phone, avatarUrl } = req.body;

        return res.status(200).json({
            message: 'Perfil actualizado',
            data: {
                name,
                phone,
                avatarUrl
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar perfil'
        });
    }
});

export default router;