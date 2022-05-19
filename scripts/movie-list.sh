#!/bin/bash
movie_dir=/home/garett/drive3/Movies
anime_dir=/home/garett/drive2/Anime
tv_dir=/home/garett/drive2/TV
output_dir=/tmp/gortbot/plex/lists

ls -l $movie_dir | awk '{print substr($0, index($0,$9))}' > $output_dir/movies.txt
# ls -l $anime_dir | awk '{print substr($0, index($0,$9))}' > $output_dir/anime.txt
# ls -l $tv_dir | awk '{print substr($0, index($0,$9))}' > $output_dir/tv.txt
