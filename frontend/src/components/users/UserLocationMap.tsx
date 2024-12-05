// src/components/users/UserLocationMap.tsx

import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import 'leaflet/dist/leaflet.css';
import Card from '../ui/Card';

interface LocationData {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    user_count: number;
    expense_count: number;
    total_amount: number;
}

const UserLocationMap: React.FC = () => {
    const { data: mapData, isLoading } = useQuery({
        queryKey: ['user-locations'],
        queryFn: async () => {
            const response = await fetch('/api/users/map-data', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch map data');
            }
            const data = await response.json();
            return data.data as LocationData[];
        }
    });

    if (isLoading) {
        return <div>加载地图数据中...</div>;
    }

    // 计算标记大小
    const calculateMarkerSize = (userCount: number) => {
        const minSize = 20;
        const maxSize = 50;
        const scale = Math.log(userCount + 1) * 10;
        return Math.min(maxSize, Math.max(minSize, scale));
    };

    // 格式化金额
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY'
        }).format(amount);
    };

    return (
        <Card title="用户地理分布">
            <div className="h-[600px] w-full">
                <MapContainer
                    center={[35, 105]} // 中国中心位置
                    zoom={4}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mapData?.map((location, index) => (
                        <CircleMarker
                            key={`${location.latitude}-${location.longitude}-${index}`}
                            center={[location.latitude, location.longitude]}
                            radius={calculateMarkerSize(location.user_count)}
                            fillColor="#3b82f6"
                            color="#2563eb"
                            weight={1}
                            opacity={0.8}
                            fillOpacity={0.6}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold text-lg">
                                        {location.city}, {location.country}
                                    </h3>
                                    <div className="mt-2 space-y-1">
                                        <p>用户数量: {location.user_count}</p>
                                        <p>支出记录: {location.expense_count} 条</p>
                                        <p>总支出: {formatAmount(location.total_amount)}</p>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-blue-900 font-medium">总用户数</h4>
                    <p className="text-2xl font-bold text-blue-600">
                        {mapData?.reduce((sum, loc) => sum + loc.user_count, 0)}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-green-900 font-medium">覆盖城市</h4>
                    <p className="text-2xl font-bold text-green-600">
                        {mapData?.length}
                    </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-purple-900 font-medium">总支出记录</h4>
                    <p className="text-2xl font-bold text-purple-600">
                        {mapData?.reduce((sum, loc) => sum + loc.expense_count, 0)}
                    </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="text-orange-900 font-medium">总支出金额</h4>
                    <p className="text-2xl font-bold text-orange-600">
                        {formatAmount(mapData?.reduce((sum, loc) => sum + loc.total_amount, 0) || 0)}
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default UserLocationMap;