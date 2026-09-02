import { useState, useEffect } from 'react';

// Giả lập lấy permissions từ localStorage sau khi login (Phase 1)
export const usePermission = (moduleName: string, action: string) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    // Lấy thông tin user/permissions từ local storage hoặc state management
    const storedPermissions = localStorage.getItem('permissions');
    
    if (storedPermissions) {
      try {
        const permissions: Array<{ module: string; action: string }> = JSON.parse(storedPermissions);
        
        const isGranted = permissions.some(
          (p) => p.module === moduleName && p.action === action
        );
        
        setHasPermission(isGranted);
      } catch (error) {
        console.error("Failed to parse permissions", error);
        setHasPermission(false);
      }
    }
  }, [moduleName, action]);

  return hasPermission;
};
