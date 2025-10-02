
file 'node_modules' do 
  sh "pnpm install"
end 
task :install => 'node_modules'

task :clean do 
  sh "rm -rf node_modules"
end

task :dev => [:install] do 
  sh "pnpm astro dev --host"
end 

task :build => [:install] do
  sh "pnpm astro build"
end 