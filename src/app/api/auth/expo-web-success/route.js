import { getToken } from '@auth/core/jwt';
export async function GET(request) {
	const [token, jwt] = await Promise.all([
		getToken({
			req: request,
			secret: process.env.AUTH_SECRET,
			secureCookie: (process.env.AUTH_URL || '').startsWith('https'),
			raw: true,
		}),
		getToken({
			req: request,
			secret: process.env.AUTH_SECRET,
			secureCookie: (process.env.AUTH_URL || '').startsWith('https'),
		}),
	]);

	if (!jwt) {
		return new Response(
				`
				<html>
					<body>
						<script>
							(function(){
							  const BUILD_TRUSTED_PARENT_ORIGIN = ${JSON.stringify(process.env.NEXT_PUBLIC_PARENT_ORIGIN ?? '')};
							  function getParentOrigin(){ try{ if(BUILD_TRUSTED_PARENT_ORIGIN) return BUILD_TRUSTED_PARENT_ORIGIN; if(document.referrer) return new URL(document.referrer).origin; return null }catch(e){ return null } }
							  const target = getParentOrigin();
							  if(target) window.parent.postMessage({ type: 'AUTH_ERROR', error: 'Unauthorized' }, target);
							  else console.warn('postMessage suppressed because no trusted parent origin found');
							})();
						</script>
					</body>
				</html>
				`,
			{
				status: 401,
				headers: {
					'Content-Type': 'text/html',
				},
			}
		);
	}

	const message = {
		type: 'AUTH_SUCCESS',
		jwt: token,
		user: {
			id: jwt.sub,
			email: jwt.email,
			name: jwt.name,
		},
	};

	return new Response(
		`
		<html>
			<body>
				<script>
					(function(){
					  const BUILD_TRUSTED_PARENT_ORIGIN = ${JSON.stringify(process.env.NEXT_PUBLIC_PARENT_ORIGIN ?? '')};
					  function getParentOrigin(){ try{ if(BUILD_TRUSTED_PARENT_ORIGIN) return BUILD_TRUSTED_PARENT_ORIGIN; if(document.referrer) return new URL(document.referrer).origin; return null }catch(e){ return null } }
					  const target = getParentOrigin();
					  if(target) window.parent.postMessage(${JSON.stringify(message)}, target);
					  else console.warn('postMessage suppressed because no trusted parent origin found');
					})();\n
				</script>
			</body>
		</html>
		`,
		{
			headers: {
				'Content-Type': 'text/html',
			},
		}
	);
}
