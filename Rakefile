
file 'node_modules' do 
  sh "pnpm install"
end 
task :install => 'node_modules'

task :dev => [:install] do 
  sh "pnpm astro dev --host"
end 

task :build => [:install] do
  sh "pnpm astro build"
end 