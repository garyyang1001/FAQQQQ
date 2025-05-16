
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, LogIn, Trash2, AlertTriangle, ListChecks } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authenticateAndFetchLogs, authenticateAndClearLogs } from './actions';
import type { Logs, LogEntry } from '@/lib/logger';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logs, setLogs] = useState<Logs>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  // Store credentials after successful login to reuse for clear action
  const [storedCredentials, setStoredCredentials] = useState<LoginFormValues | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    const response = await authenticateAndFetchLogs(values);
    if (response.success) {
      setIsLoggedIn(true);
      setLogs(response.logs || []);
      setStoredCredentials(values); // Store credentials
    } else {
      setError(response.error || 'Login failed.');
    }
    setIsLoading(false);
  };

  const handleClearLogs = async () => {
    if (!storedCredentials) {
      setError("Credentials not found for clearing logs. Please log in again.");
      setIsLoggedIn(false); // Force re-login
      return;
    }
    setIsClearing(true);
    setError(null);
    const response = await authenticateAndClearLogs(storedCredentials);
    if (response.success) {
      setLogs([]); // Clear logs from view
      // Optionally, show a success message via toast or alert
    } else {
      setError(response.error || 'Failed to clear logs.');
      if (response.error?.includes("Invalid credentials")) {
         setIsLoggedIn(false); // Force re-login if auth for clear fails
         setStoredCredentials(null);
      }
    }
    setIsClearing(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><LogIn className="mr-2 h-6 w-6 text-primary"/>Admin Login</CardTitle>
            <CardDescription>Access the application logs.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Login Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center">
            <ListChecks className="mr-3 h-8 w-8 text-primary"/>
            <div>
                <h1 className="text-3xl font-bold text-primary">Admin Logs</h1>
                <p className="text-muted-foreground">Logged activity from the FAQ Generator.</p>
            </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isClearing}>
                    {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All Logs
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all log entries.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearLogs} disabled={isClearing}>
                      {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="outline" onClick={() => {
                  setIsLoggedIn(false);
                  setStoredCredentials(null);
                  setLogs([]);
                  setError(null);
                  form.reset();
              }}>
                Logout
              </Button>
        </div>
      </header>

      {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

      {logs.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No log entries found.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {logs.map((log, index) => (
            <AccordionItem value={`log-${index}`} key={index} className="bg-card border rounded-lg shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-left">
                    <span className="font-medium text-primary truncate max-w-xs sm:max-w-md md:max-w-lg" title={log.url}>URL: {log.url}</span>
                    <span className="text-xs text-muted-foreground mt-1 sm:mt-0">
                        {new Date(log.timestamp).toLocaleString()}
                    </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0 space-y-4">
                {log.error && (
                     <div className="mt-2">
                        <h4 className="font-semibold text-destructive">Error:</h4>
                        <pre className="mt-1 text-xs bg-destructive/10 p-2 rounded-md text-destructive whitespace-pre-wrap break-all">
                            {log.error}
                        </pre>
                    </div>
                )}
                {log.keywords && log.keywords.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-primary/90">Keywords:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {log.keywords.map((kw, i) => (
                        <span key={i} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
                {log.peopleAlsoAsk && log.peopleAlsoAsk.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-primary/90">People Also Ask:</h4>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {log.peopleAlsoAsk.map((paa, i) => (
                        <li key={i} className="text-xs text-muted-foreground">{paa.question}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {log.faqSchema && (
                  <div>
                    <h4 className="font-semibold text-sm text-primary/90">FAQ Schema:</h4>
                    <pre className="mt-1 text-xs bg-muted/50 p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
                      {log.faqSchema}
                    </pre>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
       <footer className="text-center mt-12 py-6 border-t">
         <p className="text-sm text-muted-foreground">
           Admin Panel - © {new Date().getFullYear()} <a href="https://ohya.co" target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">好事發生數位</a>
         </p>
       </footer>
    </div>
  );
}
