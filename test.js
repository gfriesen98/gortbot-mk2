async function search(message){
    console.log(message);
    const q = ['Tay K - The Race [Official Audio]', 'Baby Keem, Kendrick Lamar - range brothers (Official Audio)']; // titles in queue (example)
    const query = message.replace('g!inq ', '').split(' '); // 'g!inq range brothers' => '['range', 'brothers']';
    const queryWords = query.map(m => {m = m.replace(/[^\w\s]/gi, ''); return m.toLowerCase()}); // get rid of special characters 
    const queryLetters = query.map(m => { // get rid of special characters and split words into => [[r, a, n, g, e], [b, r, o, s...]]
        m = m.replace(/[^\w\s]/gi, '').toLowerCase();
        return m.split('');
    });
    console.log(queryLetters);
    console.log(queryWords);
    const queueTitles = q.map((n, i) => { // create an object to...
        return {
            title: n, // ...get the song in queue title
            words: n.split(' ').map(m => {m = m.replace(/[^\w\s]/gi, ''); return m.toLowerCase()}), // ...split song in queue into words like above
            wordLetters: n.split(' ').map(m => { // ...split words into letter array like above
                if (m !== '-') {// TODO need to figure out how to prevent returning undefined as an index (else return null issue)
                    m = m.replace(/[^\w\s]/gi, '').toLowerCase();
                    return m.split('');
                }
            }),
            queueIndex: i // ...get the index in queue for reference
        };
    });

    const results = queueTitles.map(n => { // loop queueTitles
        console.log(n.wordLetters);
        var totalWords = 0; // set up stupid tracker points
        var totalLetters = 0;
        var points = 0;

        queryWords.map(m => { // loop query input words
            var matchingWords = 0;
            var matchingLetters = 0;

            if (n.words.indexOf(m) !== -1) { // if queue words array includes query word
                console.log("query[m]("+m+") matches");
                matchingWords++; // add matching word
            } else { // if word does not match
                // get into query & queue sub arrays
                for (let i = 0; i < queryLetters.length; i++) {
                    for (let j = 0; j < n.wordLetters.length; j++) {
                        if (n.wordLetters[j] !== undefined) {
                            // compare arrays for matching elements
                            const matches = queryLetters[i].filter(e => n.wordLetters[j].includes(e));
                            matchingLetters += matches.length;
                            console.log(matches);
                        }
                    }
                }
            }
            console.log('words: ', matchingWords);
            console.log('letters: ', matchingLetters);

            // need to figure out how to weight words and letters, or somehow apply partial matching points
            // if letter array is the same length as the word, and contains the same characters, it should count as a full match
            totalWords += matchingWords;
            totalLetters += matchingLetters;
            for (let i = 0; i < matchingWords; i++) {
                points += 10; //full words gets lots of points
            }

            for (let i = 0; i < matchingLetters; i++) {
                points += 0.01; //letter matches get small amount of point because there can be a ton of them depending on spam/horrible spelling
                                //generally, this should just be better
            }
        });
        return {totalLetters, totalWords, points: points, match: n};
    });

    console.log(results.sort((a, b) => b.points - a.points));

    // const results = queueTitles.map(n => {
    //     var matchingWordIdx = 0;
    //     var matchingLetterIdx = 0;
    //     var totalLetters = 0;
    //     for (const m of query) {
    //         n.words.forEach(w => {
    //             console.log('m',m);
    //             console.log('w', w);
    //             if (m === w) {
    //                 matchingWordIdx++;
    //             } else {
    //                 console.log('else');
    //                 const qSplit = m.split('');
    //                 for (const p of n.wordLetters){
    //                     totalLetters+=p.length;
    //                     for(const g of qSplit) {
    //                         if (g === p) {
    //                             matchingLetterIdx++;
    //                         }
    //                     }
    //                 }
    //             }
    //         });
    //         console.log('letters: ',matchingLetterIdx);
    //         console.log('words: ',matchingWordIdx);
    //         return {
    //             matchingWordIdx: (matchingWordIdx/n.words.length)*100,
    //             matchingLetterIdx: (matchingLetterIdx/totalLetters)*100,
    //             searchQuery: query.join(" "),
    //             bestMatch: queueTitles[n.queueIndex]
    //         }
    //     }
    // });
    // console.log(results);
}
// how to determine weight of letter matches doe
search('g!inq ragne borthers');