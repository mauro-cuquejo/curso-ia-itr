/**
 * Dashboard
 *
 * @description Componente principal del panel de control, que muestra
 * estadísticas generales, gráficos y resúmenes de datos importantes
 * para el usuario administrador.
 *
 * @author ITR Team
 * @since 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { Grid, Typography, Paper } from '@mui/material';
import SystemStatus from '../components/dashboard/SystemStatus';
import UserCountCard from '../components/dashboard/UserCountCard';
import { fetchDashboardData } from '../api/dashboardApi';
import { useDispatch, useSelector } from 'react-redux';
import { setDashboardData } from '../slices/dashboardSlice';
import Loader from '../components/ui/Loader';
import ErrorAlert from '../components/ui/ErrorAlert';

function Dashboard() {
    const dispatch = useDispatch();
    const { data: dashboardData, loading, error } = useSelector(state => state.dashboard);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const data = await fetchDashboardData();
                dispatch(setDashboardData(data));
            } catch (err) {
                console.error(err);
            }
        };

        loadDashboardData();
    }, [dispatch]);

    if (loading) return <Loader />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <Grid container spacing={3}>
            {/* Estado del Sistema */}
            <Grid item xs={12} md={6}>
                <SystemStatus />
            </Grid>

            {/* Total de Usuarios */}
            <Grid item xs={12} md={6}>
                <UserCountCard />
            </Grid>

            {/* Resto de las cards... */}
            <Grid item xs={12} md={4}>
                <StatsCard
                    title="Usuarios Activos"
                    value={stats?.active_users || 0}
                    icon={PeopleIcon}
                    color="primary"
                />
            </Grid>

            {/* Otras secciones del dashboard */}
            {/* ... */}
        </Grid>
    );
}

export default Dashboard;