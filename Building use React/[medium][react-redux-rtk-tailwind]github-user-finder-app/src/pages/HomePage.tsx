import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLazySearchUsersQuery } from '@/features/users/usersApi.ts';
import { Spinner } from '@/components/ui';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useState } from 'react';

const FormSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

type User = {
  id: number;
  login: string;
  avatar_url: string;
}

const HomePage = () => {
  const [searchUsers, { error, isLoading }] = useLazySearchUsersQuery();
  const [searchResults, setSearchResults] = useState<User[] | null>(null);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
    },
  });

  const onSubmit = async (formData: FormSchemaType) => {
    try {
      const result = await searchUsers(formData.username).unwrap();
      setSearchResults(result.items);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setSearchResults(null);
    }
  };

  const handleResetClick = () => {
    setSearchResults(null);
    form.reset();
  };

  return (
    <Card className="flex flex-col gap-2.5 border-none shadow-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-3 rounded-lg border-2 grid gap-2.5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter username:</FormLabel>
                <FormControl>
                  <Input placeholder="For example: nagoev-alim" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
          {searchResults && searchResults.length > 0 && (
            <Button type="button" onClick={handleResetClick}>Reset Search</Button>
          )}
        </form>
      </Form>

      {isLoading && <Spinner />}
      {error && <p className="text-center font-semibold accent-red-500">{error.toString()}</p>}

      {!isLoading && !error && searchResults && searchResults.length === 0 && (
        <p className="text-center font-semibold">No users found.</p>
      )}

      {searchResults && searchResults.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {searchResults.map((user: User) => (
            <Card key={user.id}>
              <CardContent className="p-2">
                <img src={user.avatar_url} alt={user.login} className="rounded-md" />
              </CardContent>
              <CardFooter className="p-2">
                <Button className="w-full" asChild>
                  <Link to={`/user/${user.login}`}>About {user.login}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default HomePage;
