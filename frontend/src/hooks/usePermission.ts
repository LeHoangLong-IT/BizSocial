import { useAuthStore } from '@/store/authStore';

export function usePermission(moduleName: string, action: string) {
  // Thực tế, moduleId sẽ cần được map từ moduleName.
  // Ở mức đơn giản nhất, ta có thể assume Backend gửi về kèm moduleName 
  // HOẶC ta map hardcode ở Frontend. Để chính xác, Zustand nên lưu permission kèm moduleName.
  
  // Tạm thời để code gọn, ta giả định backend đã trả về `moduleName` trong permission:
  // (Cần cập nhật Backend để return moduleName trong Auth API)
  const permissions = useAuthStore((state) => state.permissions);
  
  const hasAccess = permissions.some(
    (p: any) => p.moduleName === moduleName && p.action === action
  );

  return hasAccess;
}
