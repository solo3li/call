'use client';

import React, { useState, useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { Download, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AutoUpdater() {
 const [updateAvailable, setUpdateAvailable] = useState<any>(null);
 const [isUpdating, setIsUpdating] = useState(false);
 const [progress, setProgress] = useState<{ downloaded: number; contentLength?: number } | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [dismissed, setDismissed] = useState(false);
 const [isCheckingManual, setIsCheckingManual] = useState(false);
 const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

 useEffect(() => {
 // We will allow testing in the web browser by mocking the check
 const isTauri = !!window.__TAURI_INTERNALS__;

 const checkForUpdates = async (manual = false) => {
 try {
 if (manual) setIsCheckingManual(true);
 let update = null;
 
 if (isTauri) {
 update = await check();
 } else {
 // Mocking the check for web testing
 await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
 // update = { version: "1.0.1", downloadAndInstall: async () => {} }; // Uncomment to test "update available"
 }

 if (update) {
 console.log(`Update available: ${update.version}`);
 setUpdateAvailable(update);
 setDismissed(false);
 setStatusMessage(null);
 } else if (manual) {
 setStatusMessage({ type: 'success', text: "تطبيقك محدث للنسخة الأخيرة." });
 setTimeout(() => setStatusMessage(null), 5000);
 }
 } catch (err) {
 console.error('Failed to check for updates:', err);
 if (manual) {
 setStatusMessage({ type: 'error', text: "فشل فحص التحديثات. تأكد من اتصالك بالإنترنت." });
 setTimeout(() => setStatusMessage(null), 5000);
 }
 } finally {
 if (manual) setIsCheckingManual(false);
 }
 };

 // Listen for manual check event
 const handleManualCheck = () => checkForUpdates(true);
 window.addEventListener('manual-update-check', handleManualCheck);

 // Check immediately, then every 10 seconds (as requested)
 checkForUpdates();
 const interval = setInterval(() => checkForUpdates(false), 10000);
 
 return () => {
 clearInterval(interval);
 window.removeEventListener('manual-update-check', handleManualCheck);
 };
 }, []);

 const handleUpdate = async () => {
 if (!updateAvailable) return;
 
 setIsUpdating(true);
 setError(null);
 
 try {
 await updateAvailable.downloadAndInstall((event: any) => {
 switch (event.event) {
 case 'Started':
 setProgress({ downloaded: 0, contentLength: event.data.contentLength });
 break;
 case 'Progress':
 setProgress((prev) => ({
 ...prev,
 downloaded: (prev?.downloaded || 0) + event.data.chunkLength,
 }));
 break;
 case 'Finished':
 setProgress(null);
 break;
 }
 });
 // The app will restart automatically after install, but just in case:
 console.log('Update installed successfully');
 } catch (err: any) {
 console.error('Failed to install update:', err);
 setError(err?.message || 'فشل التحديث');
 setIsUpdating(false);
 }
 };

 if (!updateAvailable && !statusMessage && !isCheckingManual) return null;
 if (updateAvailable && dismissed && !statusMessage && !isCheckingManual) return null;

 const percent = progress && progress.contentLength 
 ? Math.round((progress.downloaded / progress.contentLength) * 100) 
 : 0;

 return (
 <AnimatePresence>
 <motion.div 
 initial={{ opacity: 0, y: 50 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9 }}
 className="fixed bottom-6 left-6 z-50 flex flex-col gap-3"
 >
 {isCheckingManual && (
 <div className="flex items-center gap-3 p-4 rounded-sm border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 w-72">
 <Loader2 size={18} className="animate-spin text-carbon-blue" />
 <span className="text-sm font-medium">جاري فحص التحديثات...</span>
 </div>
 )}

 {statusMessage && (
 <div className={`flex items-center justify-between p-4 rounded-sm border w-72 ${
 statusMessage.type === 'error' 
 ? 'border-red-200 bg-carbon-error/10 text-red-800 dark:bg-red-900/30 dark:border-red-800' 
 : 'border-green-200 bg-carbon-success/10 text-green-800 dark:bg-green-900/30 dark:border-green-800'
 }`}>
 <span className="text-sm font-medium">{statusMessage.text}</span>
 <button onClick={() => setStatusMessage(null)} className="text-current opacity-70 hover:opacity-100">
 <X size={16} />
 </button>
 </div>
 )}

 {updateAvailable && !dismissed && (
 <div className=" rounded-sm border-carbon-border bg-carbon-layer dark:bg-gray-800 dark:border-gray-700 overflow-hidden w-72">
 <div className="p-4 flex flex-col gap-2">
 <div className="flex justify-between items-start">
 <h3 className="text-sm font-medium text-carbon-text dark:text-white flex items-center gap-2">
 <Download size={16} className="text-blue-500" />
 تحديث جديد متاح
 </h3>
 <button 
 onClick={() => setDismissed(true)} 
 className="text-gray-400 hover:text-carbon-textSecondary dark:hover:text-gray-300"
 disabled={isUpdating}
 >
 <X size={16} />
 </button>
 </div>
 
 <p className="text-xs text-carbon-textSecondary dark:text-gray-400">
 الإصدار {updateAvailable.version} متاح الآن للتحميل.
 </p>
 
 {error && (
 <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
 )}

 <div className="mt-2">
 {!isUpdating ? (
 <button 
 onClick={handleUpdate}
 className="w-full bg-carbon-blue hover:bg-carbon-blueHover text-white text-xs font-semibold py-2 px-4 rounded transition-colors"
 >
 تحديث الآن
 </button>
 ) : (
 <div className="w-full bg-carbon-bg dark:bg-gray-700 text-carbon-text dark:text-gray-200 text-xs font-medium py-2 px-4 rounded flex items-center justify-center gap-2">
 <Loader2 size={14} className="animate-spin" />
 {progress ? `جاري التحميل... ${percent}%` : 'جاري التحديث...'}
 </div>
 )}
 </div>
 </div>
 </div>
 )}
 </motion.div>
 </AnimatePresence>
 );
}
