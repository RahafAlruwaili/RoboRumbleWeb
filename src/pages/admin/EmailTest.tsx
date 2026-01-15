import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EmailTest() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const testWelcomeEmail = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('send-welcome-email', {
                body: {
                    email: email,
                    fullName: 'Test User'
                }
            });

            if (error) {
                setError(`Error: ${error.message}`);
                console.error('Full error:', error);
            } else {
                setResult(data);
                console.log('Success:', data);
            }
        } catch (e: any) {
            setError(`Exception: ${e.message}`);
            console.error('Exception:', e);
        } finally {
            setLoading(false);
        }
    };

    const testPasswordResetEmail = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('send-password-reset-email', {
                body: {
                    email: email
                }
            });

            if (error) {
                setError(`Error: ${error.message}`);
                console.error('Full error:', error);
            } else {
                setResult(data);
                console.log('Success:', data);
            }
        } catch (e: any) {
            setError(`Exception: ${e.message}`);
            console.error('Exception:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">🧪 Email API Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="أدخل إيميل للاختبار"
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={testWelcomeEmail}
                            disabled={loading || !email}
                            className="flex-1"
                        >
                            {loading ? 'جاري الإرسال...' : 'اختبار Welcome Email'}
                        </Button>

                        <Button
                            onClick={testPasswordResetEmail}
                            disabled={loading || !email}
                            variant="secondary"
                            className="flex-1"
                        >
                            {loading ? 'جاري الإرسال...' : 'اختبار Password Reset'}
                        </Button>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                <pre className="whitespace-pre-wrap text-sm">{error}</pre>
                            </AlertDescription>
                        </Alert>
                    )}

                    {result && (
                        <Alert>
                            <AlertDescription>
                                <div className="text-sm">
                                    <strong>✅ النتيجة:</strong>
                                    <pre className="whitespace-pre-wrap mt-2 bg-gray-100 p-2 rounded">
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="text-xs text-gray-500 mt-4">
                        <p><strong>ملاحظة:</strong> تأكد من أن:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>الـ RESEND_API_KEY موجود في Supabase Secrets</li>
                            <li>الـ Domain (drcroborumble.com) مفعّل في Resend</li>
                            <li>افتح Console (F12) لمشاهدة الـ logs كاملة</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
