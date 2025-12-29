import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { motion } from 'framer-motion';
import { useGetUserCountQuery } from '../../store/api/apiSlice';
import { glassStyles } from '../../styles/glassStyles';

const UserCountCard = () => {
    const { data, isLoading, isError, error } = useGetUserCountQuery();

    // Debug logs
    console.log('UserCountCard - Loading:', isLoading);
    console.log('UserCountCard - Error:', isError, error);
    console.log('UserCountCard - Data:', data);

    if (isLoading) {
        return (
            <Card sx={{ ...glassStyles.formContainer, height: '100%' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress />
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card sx={{ ...glassStyles.formContainer, height: '100%' }}>
                <CardContent>
                    <Alert severity="error">
                        <Typography variant="body2">
                            Error al cargar el conteo de usuarios
                        </Typography>
                        {error?.data?.message && (
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                {error.data.message}
                            </Typography>
                        )}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const userCount = data?.data?.count || 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ height: '100%' }}
        >
            <Card sx={{ ...glassStyles.formContainer, height: '100%' }}>
                <CardContent>
                    <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 600 }}>
                        Total de Usuarios
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                        <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
                        <Typography variant="h2" component="div" color="primary" sx={{ fontWeight: 700 }}>
                            {userCount}
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                        Usuarios registrados en el sistema
                    </Typography>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default UserCountCard;
