async function search(message){
    console.log(message);
    const q = ['Tay K - The Race [Official Audio]', 'Baby Keem, Kendrick Lamar - range brothers (Official Audio)'];
    const query = message.replace('g!inq ', '').split(' ');
    const queryWords = query.map(m => {m = m.replace(/[^\w\s]/gi, ''); return m.toLowerCase()});
    const queryLetters = query.map(m => {
        m = m.replace(/[^\w\s]/gi, '').toLowerCase();
        return m.split('');
    });
    console.log(queryLetters);
    console.log(queryWords);
    const queueTitles = q.map((n, i) => {
        return {
            title: n,
            words: n.split(' ').map(m => {m = m.replace(/[^\w\s]/gi, ''); return m.toLowerCase()}),
            wordLetters: n.split(' ').map(m => {
                if (m !== '-') {
                    m = m.replace(/[^\w\s]/gi, '').toLowerCase();
                    return m.split('');
                }
            }),
            queueIndex: i
        };
    });

    const results = queueTitles.map(n => {
        console.log(n.wordLetters);
        var totalWords = 0;
        var totalLetters = 0;
        var points = 0;
        queryWords.map(m => {
            var matchingWords = 0;
            var matchingLetters = 0;
            if (n.words.indexOf(m) !== -1) {
                console.log("query[m]("+m+") matches");
                matchingWords++;
            } else {
                for (let i = 0; i < queryLetters.length; i++) {
                    for (let j = 0; j < n.wordLetters.length; j++) {
                        if (n.wordLetters[j] !== undefined) {
                            const lol = queryLetters[i].filter(e => n.wordLetters[j].includes(e));
                            matchingLetters += lol.length;
                            console.log(lol);
                        }
                    }
                }
            }
            console.log('words: ', matchingWords);
            console.log('letters: ', matchingLetters);

            // need to figure out how to weight words and letters
            totalWords += matchingWords;
            totalLetters += matchingLetters;
            for (let i = 0; i < matchingWords; i++) {
                points += 10;
            }

            for (let i = 0; i < matchingLetters; i++) {
                points += 0.01;
            }
        });
        return {totalLetters, totalWords, points: Math.round(points), match: n};
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
search('g!inq ');