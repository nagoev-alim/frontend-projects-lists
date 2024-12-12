import { useNavigate, useParams } from 'react-router-dom';
import { useGetUserDetailsQuery, useGetUserReposQuery } from '@/features/users/usersApi.ts';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';
import { Spinner } from '@/components/ui';
import { FaCodepen, FaEye, FaInfo, FaLink, FaStar, FaStore, FaUsers, FaUtensils } from 'react-icons/fa6';
import { FaUserFriends } from 'react-icons/fa';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type Repository = {
  id: number;
  name: string;
  description: string;
  html_url: string;
  forks: number;
  open_issues: number;
  watchers_count: number;
  stargazers_count: number;
}

const DetailPage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { data: user, error: userError, isLoading: userLoading } = useGetUserDetailsQuery(username ?? '');
  const { data: repos, error: reposError, isLoading: reposLoading } = useGetUserReposQuery(username ?? '');

  const handleGoBack = useCallback(() => navigate(-1), [navigate]);

  if (!username) {
    return <div className="text-center font-semibold text-red-500">Username not provided</div>;
  }

  if (userLoading || reposLoading) return <Spinner />;
  if (userError) return <div className="text-center font-semibold text-red-500">Error loading user data</div>;
  if (reposError) return <div className="text-center font-semibold text-red-500">Error loading repositories</div>;

  return (
    <div className="max-w-6xl mx-auto w-full my-4 space-y-6">
      <Button onClick={handleGoBack}>
        Go Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>About: {user.name || user.login}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={user.avatar_url} alt={user.login} />
              <AvatarFallback>{user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">{user.login}</h3>
              <Badge variant="secondary">{user.type}</Badge>
              {user.hireable && <Badge variant="outline">Hireable</Badge>}
              <p>{user.bio}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Button variant="outline" asChild>
              <a href={user.html_url} target="_blank" rel="noreferrer">
                Visit Github Profile
              </a>
            </Button>
            {user.location && <p><strong>Location:</strong> {user.location}</p>}
            {user.blog && (
              <p>
                <strong>Website:</strong>{' '}
                <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank"
                   rel="noreferrer" className="text-blue-500 hover:underline">
                  {user.blog}
                </a>
              </p>
            )}
            {user.twitter_username && (
              <p>
                <strong>Twitter:</strong>{' '}
                <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noreferrer"
                   className="text-blue-500 hover:underline">
                  @{user.twitter_username}
                </a>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Followers', value: user.followers, icon: <FaUsers className="w-5 h-5" /> },
              { label: 'Following', value: user.following, icon: <FaUserFriends className="w-5 h-5" /> },
              { label: 'Public Repos', value: user.public_repos, icon: <FaCodepen className="w-5 h-5" /> },
              { label: 'Public Gists', value: user.public_gists, icon: <FaStore className="w-5 h-5" /> },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                {stat.icon}
                <div>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Repositories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {repos.map(({
                          id,
                          name,
                          description,
                          html_url,
                          forks,
                          open_issues,
                          watchers_count,
                          stargazers_count,
                        }: Repository) => (
              <Card key={id}>
                <CardHeader>
                  <CardTitle>
                    <a href={html_url} className="text-blue-500 hover:underline flex items-center space-x-2">
                      <FaLink className="w-4 h-4" />
                      <span>{name}</span>
                    </a>
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { icon: <FaEye className="w-4 h-4" />, value: watchers_count, label: 'Watchers' },
                      { icon: <FaStar className="w-4 h-4" />, value: stargazers_count, label: 'Stars' },
                      { icon: <FaInfo className="w-4 h-4" />, value: open_issues, label: 'Issues' },
                      { icon: <FaUtensils className="w-4 h-4" />, value: forks, label: 'Forks' },
                    ].map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center space-x-1">
                        {item.icon}
                        <span>{item.value}</span>
                        <span className="sr-only">{item.label}</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailPage;
