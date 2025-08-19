import { useCallback } from 'react';
import api, { setAccessToken, clearAccessToken } from '../axios';
import type { AuthLoginBody, AuthLoginResponse, AuthRegisterBody, AuthRefreshResponse, Role } from '../types';
import { useDispatch } from 'react-redux';
import { setAuth, clearAuth } from '../../slices/auth.slice';
import { decodeJwt } from '../jwt';

type LoginResult = { access: string; role?: Role; email?: string };

export function useAuth() {
	const dispatch = useDispatch();

	const login = useCallback(async (body: AuthLoginBody): Promise<LoginResult> => {
		const { data } = await api.post<AuthLoginResponse>('/auth/login', body);
		const access = data.access;
		const payload = decodeJwt<{ role?: Role; email?: string }>(access) ?? {};
		setAccessToken(access);
		dispatch(setAuth({ accessToken: access, role: payload.role, email: payload.email }));
		return { access, role: payload.role, email: payload.email };
	}, [dispatch]);

	const register = useCallback(async (body: AuthRegisterBody) => {
		await api.post('/auth/register', body);
	}, []);

	const refresh = useCallback(async () => {
		const { data } = await api.post<AuthRefreshResponse>('/auth/refresh');
		const access = data.access;
		const payload = decodeJwt<{ role?: Role; email?: string }>(access) ?? {};
		setAccessToken(access);
		dispatch(setAuth({ accessToken: access, role: payload.role, email: payload.email }));
		return access;
	}, [dispatch]);

	const logout = useCallback(() => {
		clearAccessToken();
		dispatch(clearAuth());
	}, [dispatch]);

	return { login, register, refresh, logout };
}

export default useAuth;
