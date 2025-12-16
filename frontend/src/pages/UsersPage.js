/**
 * Página de Usuarios
 *
 * Muestra el listado de usuarios consumiendo el endpoint protegido
 * vía RTK Query. Incluye estados de carga, error y vacíos.
 */
import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
} from '@mui/material';
import { useGetUsersQuery } from '../store/api/apiSlice';
import { useSelector } from 'react-redux';

function UsersPage() {
    const filters = useSelector((state) => state.users?.filters || {});

    const queryParams = {
        page: filters.page || filters.pagination?.page || 1,
        limit: filters.limit || filters.pagination?.limit || 10,
        search: filters.search || undefined,
        status: filters.status && filters.status !== 'all' ? filters.status : undefined,
        sort: filters.sort || 'created_at',
        order: (filters.order || 'DESC').toUpperCase(),
    };

    const {
        data,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useGetUsersQuery(queryParams, { skip: false });

    const users = Array.isArray(data?.data?.users)
        ? data.data.users
        : Array.isArray(data?.users)
            ? data.users
            : Array.isArray(data)
                ? data
                : [];

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Usuarios
            </Typography>

            <Card sx={{ mb: 2 }}>
                {isLoading || isFetching ? <LinearProgress /> : null}
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" color="text.secondary">
                            Listado de usuarios registrados
                        </Typography>
                        <Button variant="outlined" size="small" onClick={() => refetch()} disabled={isFetching}>
                            {isFetching ? 'Actualizando...' : 'Refrescar'}
                        </Button>
                    </Box>

                    {error ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            No se pudieron cargar los usuarios. Intenta nuevamente.
                        </Alert>
                    ) : null}

                    {users.length === 0 && !isLoading && !error ? (
                        <Typography variant="body2" color="text.secondary">
                            No hay usuarios para mostrar.
                        </Typography>
                    ) : null}

                    {users.length > 0 ? (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Creado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u.id} hover>
                                            <TableCell>{u.id}</TableCell>
                                            <TableCell>{`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.name || '—'}</TableCell>
                                            <TableCell>{u.email || '—'}</TableCell>
                                            <TableCell>{u.status || '—'}</TableCell>
                                            <TableCell>{u.created_at ? new Date(u.created_at).toLocaleString() : '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : null}
                </CardContent>
            </Card>
        </Box>
    );
}

export default UsersPage;
