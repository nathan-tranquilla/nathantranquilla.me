task :default do 
  sh "rake -T"
end 

file 'node_modules' do 
  sh "pnpm install"
end 

task :install => 'node_modules'

task :clean do 
  sh "rm -rf node_modules"
end

task :format_src => [:install] do 
  sh "pnpm exec prettier ./src --write"
end

task :format => [:format_src, :format_blogs]

desc "Dev Server"
task :dev => [:install] do 
  sh "pnpm astro dev --host"
end 

desc "Production Build"
task :build => [:install] do
  sh "pnpm astro build"
end 

task :format_blogs do
  puts "Formatting blog markdown files to 100-character line limits..."
  
  Dir.glob('src/pages/blogs/*.md').each do |file|
    puts "Processing: #{file}"
    
    # Read the file content
    content = File.read(file)
    
    # Split into lines and process each line
    formatted_lines = []
    in_frontmatter = false
    frontmatter_count = 0
    in_code_block = false
    
    content.lines.each do |line|
      # Track frontmatter boundaries
      if line.strip == '---'
        frontmatter_count += 1
        in_frontmatter = frontmatter_count == 1
        formatted_lines << line
        next
      end
      
      # Skip formatting for frontmatter
      if in_frontmatter
        formatted_lines << line
        next
      end
      
      # Track code blocks
      if line.strip.start_with?('```')
        in_code_block = !in_code_block
        formatted_lines << line
        next
      end
      
      # Skip formatting for code blocks
      if in_code_block
        formatted_lines << line
        next
      end
      
      # Skip formatting for headers, empty lines, and lines that start with special chars
      if line.strip.empty? || line.match(/^#+\s/) || line.match(/^[-*]\s/) || line.match(/^\s*$/)
        formatted_lines << line
        next
      end
      
      # Format line to 100 characters
      if line.length > 100
        # Remove existing newline
        line = line.chomp
        
        # Split into words
        words = line.split(' ')
        current_line = ''
        
        words.each do |word|
          # If adding this word would exceed 100 chars, start a new line
          if (current_line + ' ' + word).length > 100 && !current_line.empty?
            formatted_lines << current_line + "\n"
            current_line = word
          else
            if current_line.empty?
              current_line = word
            else
              current_line += ' ' + word
            end
          end
        end
        
        # Add the remaining line
        formatted_lines << current_line + "\n" unless current_line.empty?
      else
        formatted_lines << line
      end
    end
    
    # Write the formatted content back to the file
    File.write(file, formatted_lines.join)
  end
  
  puts "Blog formatting complete!"
end 
