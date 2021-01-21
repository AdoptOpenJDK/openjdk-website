#!/usr/bin/env bash
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# This script adds the release notes for a specific openjdk version
# to a clone of the AdoptOpenJDK openjdk-website repository.
# release_notes_creation_script.sh openjdk_version website_repo_clone_location

# Step 1: Argument validity checks.

echo "release_notes_creation_script.sh is now running."

if [ $# -lt 2 ]
then
    echo "ERROR: Insufficient arguments"
    exit 1
fi

if [ ! -d "$2" ]
then
    echo "ERROR: 2nd argument $2 is not a valid directory."
    exit 1
fi

# Step 2: Fetch release note sources.

# Step 3: Put the release notes into the relevant website pages.

# Step Temp: Do anything, to prove this script is being run, and that it modifies the website repo.

random_num=$RANDOM

echo "Script is adding random number ${random_num}"

echo ${random_num} > $2/Stuffins.txt

echo "release_notes_creation_script.sh has now successfully finished."
